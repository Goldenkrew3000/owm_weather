API Map:

GET: /searchLocation?location=강남구
RES:
{
    code: 200, (Can be 200, or 400)
    count: 2; (Makes it really easy to know the amount of elements, if i just send it along)
    0: {
        //
    },
    1: {
        //
    } (Max of 5 entries 0-4)
}
