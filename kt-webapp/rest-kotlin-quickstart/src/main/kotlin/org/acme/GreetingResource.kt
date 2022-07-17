package org.acme

import org.acme.rest.Greeting
import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.Produces
import javax.ws.rs.core.MediaType

@Path("/hello")
class GreetingResource {

    @GET
    fun hello() = Greeting("hello")
}