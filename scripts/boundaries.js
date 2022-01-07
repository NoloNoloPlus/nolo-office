function findBoundaries(r) {
    let startDate = null, endDate = null;

    let object_id = Object.keys(r.products)[0];
    for (value of Object.values(r.products[object_id].instances)) {
        for (var i = 0; i < value.dateRanges.length; i++) {

            let to = new Date(value.dateRanges[i].to);
            let from = new Date(value.dateRanges[i].from);

            startDate = (startDate == null) ? from : (startDate > from) ? from : startDate;
            endDate = (endDate == null) ? to : (endDate < to) ? to : endDate;
        }
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return [startDate, endDate];
}