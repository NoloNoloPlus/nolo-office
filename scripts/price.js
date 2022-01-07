const _MS_PER_DAY = 1000 * 60 * 60 * 24;

function applyContainsWeekendDiscount(price, dateRange, discount) {
    if (discount.type != 'containsWeekend') {
        throw new Error('Discount type must be "containsWeekend"');
    }

    for (let day = new Date(dateRange.from); day <= dateRange.to; day.setDate(day.getDate() + 1)) {
        if (day.getDay() === 5) { // Friday
            const monday = new Date(day.getDate() + 3);

            if (monday <= dateRange.to) {
                // Apply discount
                
                // Sunday is free
                price -= dateRange.price;

                // Saturday is discounted
                price -= dateRange.price * discount.value;
            }
        }
    }

    return price;
}

function applyContainsWeekendDiscounts(price, dateRange, discounts) {
    for (const discount of discounts) {
        if (discount.type === 'containsWeekend') {
            price -= applyContainsWeekendDiscount(price, dateRange, discount);
        }
    }

    return price;
}

function applyStandardDiscounts(price, discounts) {
    if (discounts) {
        for (const discount of discounts) {
            if (discount.type === 'percentage') {
                price *= 1 - discount.value;
            } else if (discount.type === 'fixed') {
                price -= discount.value;
            } else if (discount.type === 'containsWeekend') {
                // Ignore
            } else {
                throw new Error(`Unknown discount type: ${discount.type}`)
            }
        }
    }

    return price;
}

function dateRangePrice(dateRange, discounted) {
    const from = new Date(dateRange.from)
    const to = new Date(dateRange.to)

    const nDays = Math.round((to.getTime() - from.getTime()) / _MS_PER_DAY) + 1;
    let totalPrice = nDays * parseFloat(dateRange.price);

    if (discounted) {
        // Apply containsWeekend discount
        applyContainsWeekendDiscounts(totalPrice, dateRange, dateRange.discounts);

        // Apply standard discounts
        totalPrice = applyStandardDiscounts(totalPrice, dateRange.discounts)
    }

    return totalPrice
}

function instancePrice(instance, discounted) {
    let totalPrice = 0;

    for (const dateRange of instance.dateRanges) {
        totalPrice += dateRangePrice(dateRange, true)
    }

    if (discounted) {
        totalPrice = applyStandardDiscounts(totalPrice, instance.discounts)
    }

    return totalPrice;
}

function productPrice(product, discounted) {
    let totalPrice = 0;

    for (const instance of Object.values(product.instances)) {
        totalPrice += instancePrice(instance, true)
    }

    if (discounted) {
        totalPrice = applyStandardDiscounts(totalPrice, product.discounts)
    }

    return totalPrice;
}

function rentalPrice(rental, discounted) {
    let totalPrice = 0;

    for (const product of Object.values(rental.products)) {
        totalPrice += productPrice(product, true)
    }

    if (discounted) {
        totalPrice = applyStandardDiscounts(totalPrice, rental.discounts)
    }

    return totalPrice;
}

// export {
//     applyContainsWeekendDiscount,
//     dateRangePrice,
//     instancePrice,
//     productPrice,
//     rentalPrice
// }