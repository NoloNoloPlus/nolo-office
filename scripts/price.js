const _MS_PER_DAY = 1000 * 60 * 60 * 24;

function applyContainsWeekendDiscount(price, dateRange, discount) {
    if (discount.type != 'containsWeekend') {
        throw new Error('Discount type must be "containsWeekend"');
    }

    var to = new Date(dateRange.to);

    for (let day = new Date(dateRange.from); day <= to; day.setDate(day.getDate() + 1)) {
        if (day.getDay() === 5) { // Friday
            const monday = new Date(day.getDate() + 3);

            if (monday <= to) {
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
            price = applyContainsWeekendDiscount(price, dateRange, discount);
        }
    }

    return price;
}

function applySingleDiscount(price, discount, dateRange) {
    if (discount) {
        if (discount.type === 'fixed') {
            price -= discount.value;
        } else if (discount.type === 'percentage') {
            price *= 1 - discount.value;
        } else if (discount.type === 'containsWeekend') {
            price = applyContainsWeekendDiscount(price, dateRange, discount);
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
        totalPrice = applyContainsWeekendDiscounts(totalPrice, dateRange, dateRange.discounts);

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

function augmentQuote(quote) {
    for (const [k, v] of Object.entries(quote.instances)) {
        for (const [k2, v2] of Object.entries(v.dateRanges)) {
            v2.dateRangepricesBefore = [];
            v2.dateRangepricesBefore.push(dateRangePrice(v2, false).toFixed(2));

            v2.discountNames = [];
            for (const discount of v2.discounts) {
                let prevPrice = v2.dateRangepricesBefore[v2.dateRangepricesBefore.length - 1];
                v2.dateRangepricesBefore.push(applySingleDiscount(prevPrice, discount, v2).toFixed(2));
                v2.discountNames.push(discount.name);
            }
            v2.dateRangeprice = v2.dateRangepricesBefore.pop();
        }

        v.instancePricesBefore = [];
        v.instancePricesBefore.push(instancePrice(v, false).toFixed(2));

        v.discountNames = [];
        for (const discount of v.discounts) {
            let prevPrice = v.instancePricesBefore[v.instancePricesBefore.length - 1];
            v.instancePricesBefore.push(applySingleDiscount(prevPrice, discount).toFixed(2));
            v.discountNames.push(discount.name);
        }
        v.instancePrice = v.instancePricesBefore.pop();
    }

    quote.pricesBefore = [];
    quote.pricesBefore.push(productPrice(quote, false).toFixed(2));

    quote.discountNames = [];
    for (const discount of quote.discounts) {
        let prevPrice = quote.pricesBefore[quote.pricesBefore.length - 1];
        quote.pricesBefore.push(applySingleDiscount(prevPrice, discount).toFixed(2));
        quote.discountNames.push(discount.name);
    }
    quote.price = quote.pricesBefore.pop();
}

// export {
//     applyContainsWeekendDiscount,
//     dateRangePrice,
//     instancePrice,
//     productPrice,
//     rentalPrice
// }