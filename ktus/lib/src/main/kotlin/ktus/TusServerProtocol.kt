package ktus

import java.io.InputStream
import java.lang.Exception
import java.time.*
import java.time.format.DateTimeFormatter

const val SUPPORTED_CONTENT_TYPE = "application/offset+octet-stream"
const val SUPPORTED_EXTENSION = "create,create-with-upload,termination,expiration"

/**
 * Tus headers.
 */
object TusHeaders {
    val TUS_RESUMABLE = "Tus-Resumable"
    val CONTENT_TYPE = "Content-Type"
    val CONTENT_LENGTH = "Content-Length"
    val UPLOAD_OFFSET = "Upload-Offset"
    val UPLOAD_METADATA = "Upload-Metadata"
    val UPLOAD_LENGTH = "Upload-Length"
    val TUS_VERSION = "Tus-Version"
    val TUS_MAX_SIZE = "Tus-Max-Size"
    val Location = "Location"
    val TUS_EXTENSION = "Tus-Extension"
    val UPLOAD_EXPIRES = "Upload-Expires"
}

/**
 * Tus request headers.
 *
 * This class supports core protocol and below extensions.
 * - creation
 * - creation-with-upload
 * - termination
 * - expiration
 *
 * @param tusResumable `Tus-Resumable` header value.
 * @param contentType `Content-Type` header value.
 * @param contentLength `Content-Length` header value.
 * @param uploadOffset `Upload-Offset` header value.
 * @param uploadMetadata `Upload-Metadata` header value.
 * @param uploadLength `Upload-Length` header value.
 */
data class TusRequestHeaders(
    val tusResumable: String? = null,
    val contentType: String? = null,
    val contentLength: Int? = null,
    val uploadOffset: Long? = null,
    val uploadMetadata: String? = null,
    val uploadLength: Long? = null,
)

/**
 * Tus request.
 *
 * @param route the request's route (schema://host:port/path).
 * @param httpMethod the http method.
 * @param requestHeaders the request headers.
 * @param requestBody the request body.
 */
data class TusRequest(
    val route: String,
    val httpMethod: String,
    val requestHeaders: TusRequestHeaders,
    val requestBody: InputStream? = null,
)

/**
 * Tus response headers.
 *
 * This class supports core protocol and below extensions.
 *
 * - creation
 * - creation-with-upload
 * - termination
 * - expiration
 *
 * @param tusResumable `Tus-Resumable` header value.
 * @param tusVersion `Tus-Version` header value.
 * @param tusMaxSize `Tus-Max-Size` header value.
 * @param tusExtension `Tus-Extension` header value.
 * @param location `Location` header value.
 * @param uploadOffset `Upload-Offset` header value.
 * @param uploadExpires `Upload-Expires` header value.
 */
data class TusResponseHeaders(
    val tusResumable: String = "1.0.0",
    val tusVersion: String? = "1.0.0",
    val tusExtension: String? = null,
    val tusMaxSize: Long? = null,
    val location: String? = null,
    val uploadOffset: Long? = null,
    val uploadExpires: String? = null,
)

/**
 * Tus response.
 *
 * Uploading id is null when http method is OPTIONS and some error occurs.
 *
 * @property statusCode the http status code.
 * @property message the response message.
 * @property responseHeaders the tus response headers.
 * @property uploadingId the uploading id.
 */
data class TusResponse(
    val statusCode: Int,
    val message: String,
    val responseHeaders: TusResponseHeaders = TusResponseHeaders(),
    val uploadingId: String? = null
)

/**
 * Tus server protocol.
 *
 * @property uploader the tus uploader.
 */
class TusServerProtocol(
    private val uploader: TusUploader,
    private val routeRewriteRule: (String) -> String = { route -> route }
) {
    /**
     * Respond to tus request.
     *
     * @param tusRequest the tus request.
     * @return the tus response.
     */
    fun respond(tusRequest: TusRequest): TusResponse {
        return try {
            return when (tusRequest.httpMethod.uppercase()) {
                "HEAD" -> getUploadingState(tusRequest)
                "PATCH" -> updateFile(tusRequest)
                "POST" -> createNewFile(tusRequest)
                "DELETE" -> terminateUploading(tusRequest)
                "OPTIONS" -> getServerInformation()
                else -> TusResponse(
                    400,
                    """$tusRequest.httpMethod is not supported, supported methods are HEAD, 
                        |PATCH, POST, DELETE and OPTIONS""".trimMargin(),
                )
            }
        } catch (e: Exception) {
            TusResponse(500, "unexpected error occurs: $e")
        }
    }

    /**
     * Create resource.
     *
     * @param tusRequest the tus request.
     * @return the tus response.
     */
    private fun createNewFile(tusRequest: TusRequest): TusResponse {
        val (route, _, requestHeaders, requestBody) = tusRequest
        if (requestHeaders.uploadLength == null) {
            return TusResponse(400, "Upload-Length is not in request header")
        }
        if (requestHeaders.uploadLength > uploader.getUploaderConfigurations().maxSize) {
            return TusResponse(
                413, "length of upload file is over max size supported by uploader"
            )
        }
        if (requestBody != null && requestHeaders.contentType != SUPPORTED_CONTENT_TYPE) {
            return TusResponse(415, "content type is unsupported media type")
        }

        val uploadingId = uploader.generateUploadingId()
        val contentLength = uploader.createNewUpload(uploadingId, tusRequest.requestBody)
        return TusResponse(
            201, "resource is created: $uploadingId",
            TusResponseHeaders(
                location = routeRewriteRule(route).trimEnd('/').plus("/$uploadingId"),
                uploadOffset = contentLength,
                uploadExpires = getExpires(uploadingId)
            ),
            uploadingId,
        )
    }

    /**
     * Update resource.
     *
     * @param tusRequest the tus request.
     * @return the tus response.
     */
    private fun updateFile(tusRequest: TusRequest): TusResponse {
        val (route, _, requestHeaders, requestBody) = tusRequest
        val uploadingId = extractUploadingIdFromUri(route)
        if (uploader.uploadingIsExpired(uploadingId, Instant.now())) {
            return TusResponse(410, "uploading: $uploadingId is expired")
        }
        if (!uploader.uploadingIsExist(uploadingId)) {
            return TusResponse(404, "uploading: $uploadingId is not exist")
        }
        if (requestBody == null) {
            return TusResponse(400, "file contents is empty")
        }
        if (requestHeaders.uploadOffset == null) {
            return TusResponse(400, "Upload-Offset is not in request header")
        }
        if (requestHeaders.contentType != SUPPORTED_CONTENT_TYPE) {
            return TusResponse(415, "content type is unsupported media type")
        }
        val currentOffset = uploader.getLengthOfBytes(uploadingId)
        if (requestHeaders.uploadOffset != currentOffset) {
            return TusResponse(409, "upload offset is not matched to current offset")
        }

        val contentLength = uploader.appendContentsToExistFile(uploadingId, requestBody)
        return TusResponse(
            204,
            "uploading: $uploadingId is successfully appended",
            TusResponseHeaders(
                location = route, uploadOffset = currentOffset + contentLength, uploadExpires = getExpires(uploadingId)
            ),
            uploadingId,
        )
    }

    private fun getUploadingState(tusRequest: TusRequest): TusResponse {
        val uploadingId = extractUploadingIdFromUri(tusRequest.route)
        if (!uploader.uploadingIsExist(uploadingId)) {
            return TusResponse(404, "id: $uploadingId is not exist")
        }
        return TusResponse(
            200,
            "uploading is found",
            TusResponseHeaders(uploadOffset = uploader.getLengthOfBytes(uploadingId)),
            uploadingId
        )
    }

    private fun getServerInformation() = TusResponse(
        204, "get server information",
        TusResponseHeaders(
            tusMaxSize = uploader.getUploaderConfigurations().maxSize, tusExtension = SUPPORTED_EXTENSION,
        )
    )

    private fun terminateUploading(tusRequest: TusRequest): TusResponse {
        val uploadingId = extractUploadingIdFromUri(tusRequest.route)
        if (!uploader.uploadingIsExist(uploadingId)) {
            return TusResponse(404, "uploading: $uploadingId is not exist")
        }
        uploader.terminateUploading(uploadingId)
        return TusResponse(204, "uploading: $uploadingId is terminated", uploadingId = uploadingId)
    }

    private fun getExpires(id: String): String? {
        val expiredDate = uploader.getExpiredDateOfUploading(id)
        return if (expiredDate == null) {
            null
        } else DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.ofInstant(expiredDate, ZoneOffset.UTC))
    }
}

private fun extractUploadingIdFromUri(uri: String) = uri.split("/").last()
