module.exports = (err) => {
    let errList = {}
    for(let field in err.errors){
        errList[field] = err.errors[field].message
    }

    return errList
}