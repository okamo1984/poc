package org.acme.infrastructures

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.komapper.dialect.postgresql.jdbc.PostgreSqlJdbcDialect
import org.komapper.jdbc.DefaultJdbcDatabaseConfig
import org.komapper.jdbc.JdbcDatabase
import org.komapper.jdbc.JdbcSession
import org.komapper.quarkus.jdbc.QuarkusJdbcTransactionSession
import javax.enterprise.context.ApplicationScoped
import javax.inject.Inject
import javax.transaction.TransactionManager

val jdbcDatabase: JdbcDatabase = JdbcDatabase(
    DefaultJdbcDatabaseConfig(
        HikariDataSource(HikariConfig().let {
            it.username = "test"
            it.password = "test"
            it.jdbcUrl = "jdbc:postgresql://localhost:15432/testdb"
            it
        }),
        PostgreSqlJdbcDialect()
    )
)

interface JdbcDatabaseProvider {
    fun provide(): JdbcDatabase
}

@ApplicationScoped
class QuarkusJdbcDatabaseProvider @Inject constructor(private val transactionManager: TransactionManager) :
    JdbcDatabaseProvider {

    private val dataSource = object : HikariDataSource(HikariConfig().let {
        it.username = "test"
        it.password = "test"
        it.jdbcUrl = "jdbc:postgresql://localhost:15432/testdb"
        it
    }) {}

    private val config = object : DefaultJdbcDatabaseConfig(
        dataSource,
        PostgreSqlJdbcDialect()
    ) {
        override val session: JdbcSession = QuarkusJdbcTransactionSession(transactionManager, dataSource)
    }

    override fun provide() = JdbcDatabase(config)
}