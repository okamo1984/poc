package org.acme

import io.smallrye.mutiny.Uni
import org.acme.infrastructures.JdbcDatabaseProvider
import org.acme.infrastructures.QuarkusJdbcDatabaseProvider
import org.acme.models.Message
import org.acme.models.message
import org.komapper.core.dsl.Meta
import org.komapper.core.dsl.QueryDsl
import org.komapper.core.dsl.operator.desc
import javax.enterprise.context.ApplicationScoped
import javax.inject.Inject
import javax.transaction.Transactional
import javax.ws.rs.Consumes
import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.Produces

@Path("/messages")
@Transactional
@ApplicationScoped
@Produces("application/json")
@Consumes("application/json")
class MessageResource @Inject constructor(jdbcDatabaseProvider: JdbcDatabaseProvider) {

    private val database = jdbcDatabaseProvider.provide()

    @GET
    fun list(): Uni<List<Message>> {
        return Uni.createFrom().item(database.runQuery {
            val m = Meta.message
            QueryDsl.from(m).orderBy(m.id.desc())
        })
    }
}