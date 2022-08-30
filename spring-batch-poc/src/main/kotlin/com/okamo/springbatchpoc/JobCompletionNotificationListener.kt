package com.okamo.springbatchpoc

import org.slf4j.LoggerFactory
import org.springframework.batch.core.BatchStatus
import org.springframework.batch.core.JobExecution
import org.springframework.batch.core.listener.JobExecutionListenerSupport
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class JobCompletionNotificationListener constructor(@Autowired val jdbcTemplate: JdbcTemplate) :
    JobExecutionListenerSupport() {

    private val logger = LoggerFactory.getLogger(JobCompletionNotificationListener::class.java)

    override fun afterJob(jobExecution: JobExecution) {
        if (jobExecution.status == BatchStatus.COMPLETED) {
            logger.info("!!! JOB FINISHED! Time to verify the results")

            jdbcTemplate.query("SELECT first_name, last_name FROM people") { rs, row ->
                Person(rs.getString(1), rs.getString(2))
            }.forEach { person -> logger.info("Found <$person> in the database") }
        }
    }
}
