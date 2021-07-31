// The use of this Model is to have a unified Object
//  for Error.
 
class LoggerError {
    constructor(title, message, stacktrace = null){
        this.title = title
        this.message = message
        this.details = stacktrace
        this.stacktrace = stacktrace?.stack
    }
}

module.exports = LoggerError