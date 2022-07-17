package org.acme

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import org.hamcrest.CoreMatchers.*
import org.junit.jupiter.api.Test

@QuarkusTest
class GreetingResourceTest {

    @Test
    fun testHelloEndpoint() {
        given()
            .`when`().get("/hello")
            .then()
            .statusCode(200)
            .body("message", equalTo("hello"))
    }

    @Test
    fun testMessageEndpoint() {
        given()
            .`when`().get("/messages")
            .then()
            .statusCode(200)
            .body(containsString("Hello"), containsString("World"))
    }
}