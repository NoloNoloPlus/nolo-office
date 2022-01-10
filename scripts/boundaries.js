function findBoundaries(rental) {
    let startDate = null, endDate = null;

    let object_id = Object.keys(rental.products)[0];
    for (value of Object.values(rental.products[object_id].instances)) {
        for (var i = 0; i < value.dateRanges.length; i++) {

            let to = new Date(value.dateRanges[i].to);
            let from = new Date(value.dateRanges[i].from);

            startDate = (startDate == null) ? from : (startDate > from) ? from : startDate;
            endDate = (endDate == null) ? to : (endDate < to) ? to : endDate;
        }
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return [startDate, endDate];
}