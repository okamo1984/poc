package ktus.ktor

import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.utils.io.jvm.javaio.*
import ktus.TusHeaders
import ktus.TusRequest
import ktus.TusRequestHeaders
import ktus.TusResponse

fun ApplicationRequest.tusRequest(): TusRequest {
    return TusRequest(
        path(), httpMethod.value,
        TusRequestHeaders(
            tusResumable = header(TusHeaders.TUS_RESUMABLE),
            contentType = contentType().contentType,
            contentLength = header(TusHeaders.CONTENT_LENGTH)?.toInt(),
            uploadOffset = header(TusHeaders.UPLOAD_OFFSET)?.toLong(),
            uploadMetadata = header(TusHeaders.UPLOAD_METADATA),
            uploadLength = header(TusHeaders.UPLOAD_LENGTH)?.toLong(),
        ),
        receiveChannel().toInputStream()
    )
}

fun ApplicationResponse.tusResponse(tusResponse: TusResponse) {
    status(HttpStatusCode(tusResponse.statusCode, tusResponse.message))
    header(TusHeaders.TUS_RESUMABLE, tusResponse.responseHeaders.tusResumable)
    if (tusResponse.responseHeaders.tusVersion != null) {
        header(TusHeaders.TUS_VERSION, tusResponse.responseHeaders.tusVersion)
    }
    if (tusResponse.responseHeaders.tusExtension != null) {
        header(TusHeaders.TUS_EXTENSION, tusResponse.responseHeaders.tusExtension)
    }
    if (tusResponse.responseHeaders.tusMaxSize != null) {
        header(TusHeaders.TUS_MAX_SIZE, tusResponse.responseHeaders.tusMaxSize)
    }
    if (tusResponse.responseHeaders.location != null) {
        header(TusHeaders.Location, tusResponse.responseHeaders.location)
    }
    if (tusResponse.responseHeaders.uploadOffset != null) {
        header(TusHeaders.UPLOAD_OFFSET, tusResponse.responseHeaders.uploadOffset)
    }
    if (tusResponse.responseHeaders.uploadExpires != null) {
        header(TusHeaders.UPLOAD_EXPIRES, tusResponse.responseHeaders.uploadExpires)
    }
}
