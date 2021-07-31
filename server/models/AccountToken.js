class AccountToken {
    constructor(id, email, username){
        this._id = id
        this.email = email
        this.username = username
        this.createdAt = String(new Date())
    }
}

module.exports = AccountToken