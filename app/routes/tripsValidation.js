const dateSchema = {
    isDate : {
        format: 'YYYY-MM-DD'
    },
    notEmpty: true,
    in: 'query',
}
const totalTripsSchema = {
    'start':{
        ...dateSchema,
        errorMessage: "Invalid <start> format. It should be a date with the format YYYY-MM-DD",
    },
    'end':{
        ...dateSchema,
        errorMessage: "Invalid <end> format. It should be a date with the format YYYY-MM-DD",
    }
}

module.exports = {
    totalTripsSchema,
}