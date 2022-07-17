package ktus.ktor

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.routing.*
import io.ktor.server.testing.*
import ktus.*
import kotlin.test.Test
import kotlin.test.assertEquals

const val tusPath = "/files"

fun callTusServerProtocol(call: ApplicationCall) {
    val store = HashMap<String, Uploading>()
    // This initialization is for testing.
    // In production, initialize server protocol is outside each method.
    val serverProtocol = TusServerProtocol(InMemoryUploader(store))
    val creationResponse = serverProtocol.respond(call.request.tusRequest())
    call.response.tusResponse(creationResponse)
}

fun Application.main() {
    routing {
        head("$tusPath/{...}") {
            callTusServerProtocol(call)
        }
        options(tusPath) {
            callTusServerProtocol(call)
        }
        post(tusPath) {
            callTusServerProtocol(call)
        }
        put("$tusPath/{...}") {
            callTusServerProtocol(call)
        }
        delete("$tusPath/{...}") {
            callTusServerProtocol(call)
        }
    }
}

internal class KtorTusTest {

    @Test
    fun testTusOptions() {
        withTestApplication(Application::main) {
            handleRequest(HttpMethod.Options, tusPath).apply {
                assertEquals(204, response.status()?.value)
                assertEquals("1.0.0", response.headers[TusHeaders.TUS_VERSION])
                assertEquals(10 * 1024 * 1024, response.headers[TusHeaders.TUS_MAX_SIZE]?.toLong())
                assertEquals(SUPPORTED_EXTENSION, response.headers[TusHeaders.TUS_EXTENSION])
            }
        }
    }
}
