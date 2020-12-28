const dateSchema = {
    isDate: {
        format: 'YYYY-MM-DD'
    },
    notEmpty: true,
    in: 'query',
    errorMessage: "Invalid date. Require date format YYYY-MM-DD"
}
const totalTripsSchema = {
    'start': {
        ...dateSchema,
        errorMessage: "Invalid <start> format. It should be a date with the format YYYY-MM-DD",
    },
    'end':{
        ...dateSchema,
        errorMessage: "Invalid <end> format. It should be a date with the format YYYY-MM-DD",
    }
}

const fareHeatmapSchema = {
    'date': dateSchema,
}

const averageSpeedSchema = {
    'date': dateSchema,
}
module.exports = {
    totalTripsSchema,
    fareHeatmapSchema,
    averageSpeedSchema,
}