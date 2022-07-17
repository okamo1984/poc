package ktus

import java.time.Duration
import java.time.Instant
import kotlin.test.*

internal class TusServerProtocolTest {

    private val route = "https://exmaple.com/files"

    @Test
    fun testTusCreation() {
        val store = HashMap<String, Uploading>()
        val serverProtocol = TusServerProtocol(InMemoryUploader(store))
        val creationRequest =
            TusRequest(route, "POST", TusRequestHeaders(tusResumable = "1.0.0", contentLength = 0, uploadLength = 100))

        val creationResponse = serverProtocol.respond(creationRequest)

        assertEquals(201, creationResponse.statusCode)

        assertEquals(1, store.keys.size)

        val uploadingId = store.keys.first()

        assertEquals(uploadingId, creationResponse.uploadingId)
        assertEquals(route.plus("/$uploadingId"), creationResponse.responseHeaders.location)
    }

    @Test
    fun testTusCreationWithUpload() {
        val store = HashMap<String, Uploading>()
        val serverProtocol = TusServerProtocol(InMemoryUploader(store))
        val contents = "Test is test"

        val creationWithUploadRequest = TusRequest(
            route, "POST",
            TusRequestHeaders(
                tusResumable = "1.0.0",
                contentLength = contents.length,
                uploadLength = 100,
                contentType = SUPPORTED_CONTENT_TYPE
            ),
            requestBody = contents.byteInputStream()
        )

        val creationWithUploadResponse = serverProtocol.respond(creationWithUploadRequest)

        assertEquals(201, creationWithUploadResponse.statusCode)

        assertEquals(1, store.entries.size)

        val uploadingEntry = store.entries.first()
        val uploadingId = uploadingEntry.key
        val uploading = uploadingEntry.value

        assertEquals(uploadingId, creationWithUploadResponse.uploadingId)
        assertEquals(contents, String(uploading.contents!!))
        assertEquals(route.plus("/$uploadingId"), creationWithUploadResponse.responseHeaders.location)
        assertEquals(contents.length.toLong(), creationWithUploadResponse.responseHeaders.uploadOffset)
    }

    @Test
    fun testTusPatch() {
        val store = HashMap<String, Uploading>()
        val serverProtocol = TusServerProtocol(InMemoryUploader(store))

        val creationRequest = TusRequest(
            route,
            "POST",
            TusRequestHeaders(
                tusResumable = "1.0.0", contentLength = 0, uploadLength = 100, contentType = SUPPORTED_CONTENT_TYPE
            ),
        )

        val creationResponse = serverProtocol.respond(creationRequest)

        val contents = "Test is test"
        val patchRequest = TusRequest(
            creationResponse.responseHeaders.location!!, "PATCH",
            TusRequestHeaders(
                tusResumable = "1.0.0",
                contentLength = contents.length,
                uploadOffset = 0,
                contentType = SUPPORTED_CONTENT_TYPE
            ),
            contents.byteInputStream()
        )

        val patchResponse = serverProtocol.respond(patchRequest)
        println(patchResponse.message)

        assertEquals(204, patchResponse.statusCode)

        assertEquals(1, store.entries.size)

        val uploadingEntry = store.entries.first()
        val uploadingId = uploadingEntry.key
        val uploading = uploadingEntry.value

        assertEquals(uploadingId, patchResponse.uploadingId)
        assertEquals(contents, String(uploading.contents!!))
        assertEquals(route.plus("/$uploadingId"), patchResponse.responseHeaders.location)
        assertEquals(contents.length.toLong(), patchResponse.responseHeaders.uploadOffset)
    }

    @Test
    fun testTusHead() {
        val store = HashMap<String, Uploading>()
        val serverProtocol = TusServerProtocol(InMemoryUploader(store))
        val contents = "Test is test"

        val creationRequest = TusRequest(
            route, "POST",
            TusRequestHeaders(
                tusResumable = "1.0.0",
                contentLength = contents.length,
                uploadLength = 100,
                contentType = SUPPORTED_CONTENT_TYPE
            ),
            requestBody = contents.byteInputStream()
        )

        val creationResponse = serverProtocol.respond(creationRequest)

        val headRequest = TusRequest(
            creationResponse.responseHeaders.location!!, "HEAD", TusRequestHeaders(tusResumable = "1.0.0")
        )

        val headResponse = serverProtocol.respond(headRequest)

        assertEquals(200, headResponse.statusCode)
        assertEquals(contents.length.toLong(), headResponse.responseHeaders.uploadOffset)
    }

    @Test
    fun testTusOptions() {
        val serverProtocol = TusServerProtocol(InMemoryUploader(HashMap()))

        val optionsRequest = TusRequest(
            route,
            "OPTIONS",
            TusRequestHeaders(),
        )

        val optionsResponse = serverProtocol.respond(optionsRequest)

        assertEquals(204, optionsResponse.statusCode)
        assertEquals("1.0.0", optionsResponse.responseHeaders.tusVersion)
        assertEquals(10 * 1024 * 1024, optionsResponse.responseHeaders.tusMaxSize)
        assertEquals(SUPPORTED_EXTENSION, optionsResponse.responseHeaders.tusExtension)
    }

    @Test
    fun testTusTermination() {
        val store = HashMap<String, Uploading>()
        val serverProtocol = TusServerProtocol(InMemoryUploader(store))
        val contents = "Test is test"

        val creationRequest = TusRequest(
            route, "POST",
            TusRequestHeaders(
                tusResumable = "1.0.0",
                contentLength = contents.length,
                uploadLength = 100,
                contentType = SUPPORTED_CONTENT_TYPE
            ),
            requestBody = contents.byteInputStream()
        )

        val creationResponse = serverProtocol.respond(creationRequest)

        assertEquals(1, store.keys.size)

        val terminationRequest = TusRequest(
            creationResponse.responseHeaders.location!!, "DELETE", TusRequestHeaders(contentLength = 0)
        )

        val terminationResponse = serverProtocol.respond(terminationRequest)

        assertEquals(204, terminationResponse.statusCode)
        assertEquals(0, store.keys.size)
    }

    @Test
    fun testTusExpiration() {
        val store = HashMap<String, Uploading>()
        val uploader = InMemoryUploader(store)
        val serverProtocol = TusServerProtocol(uploader)
        val contents = "Test is test"

        val creationRequest = TusRequest(
            route, "POST",
            TusRequestHeaders(
                tusResumable = "1.0.0",
                contentLength = contents.length,
                uploadLength = 100,
                contentType = SUPPORTED_CONTENT_TYPE
            ),
            requestBody = contents.byteInputStream()
        )

        val creationResponse = serverProtocol.respond(creationRequest)

        val additionalContents = " of expiration"
        val expirationRequest = TusRequest(
            creationResponse.responseHeaders.location!!,
            "PATCH",
            TusRequestHeaders(
                contentLength = additionalContents.length,
                contentType = SUPPORTED_CONTENT_TYPE,
                uploadOffset = contents.length.toLong(),
                tusResumable = "1.0.0"
            ),
            additionalContents.byteInputStream()
        )

        uploader.changeUploadingExpiration(creationResponse.uploadingId!!, Instant.now() + Duration.ofDays(-1))
        val expirationResponse = serverProtocol.respond(expirationRequest)

        assertEquals(410, expirationResponse.statusCode)
    }
}
