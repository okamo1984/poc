package com.okamo.springbatchpoc

data class Person(
    var firstName: String,
    var lastName: String
) {
    constructor() : this("", "")
}
