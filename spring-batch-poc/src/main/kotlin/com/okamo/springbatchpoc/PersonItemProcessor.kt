package com.okamo.springbatchpoc

import org.slf4j.LoggerFactory
import org.springframework.batch.item.ItemProcessor

class PersonItemProcessor : ItemProcessor<Person, Person> {

    private val logger = LoggerFactory.getLogger(PersonItemProcessor::class.java)

    override fun process(item: Person): Person {
        val firstName = item.firstName.uppercase()
        val lastName = item.lastName.uppercase()

        val transformedPerson = Person(firstName, lastName)

        logger.info("Converting ($item) into ($transformedPerson)")

        return transformedPerson
    }
}
