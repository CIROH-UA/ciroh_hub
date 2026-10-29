
/**
 * @typedef {Object} RateLimitData
 * @property {string} limit - The maximum number of requests that you can make per hour.
 * @property {number} delay - The time in seconds until the rate limit resets.
 * @property {string} [resource] - The rate limit resource that the request counted against.
 * @property {string} [remaining] - The number of requests remaining in the current rate limit window.
 * @property {string} [used] - The number of requests you have made in the current rate limit window.
 * @property {boolean} exhausted - Whether the rate limit has been exhausted.
 * @property {Date} calculated_at - The time at which the rate limit data was calculated.
 * @property {Date} calculated_reset - The time at which the rate limit will reset, as a Date object.
 * @description
 * Represents the rate limit data extracted from the response headers.
 */


export class RateLimitError extends Error {
    // Header name	Description
    // x-ratelimit-limit	The maximum number of requests that you can make per hour
    // x-ratelimit-remaining	The number of requests remaining in the current rate limit window
    // x-ratelimit-used	The number of requests you have made in the current rate limit window
    // x-ratelimit-reset	The time at which the current rate limit window resets, in UTC epoch seconds
    // x-ratelimit-resource	The rate limit resource that the request counted against. For more information about the different resources, see REST API endpoints for rate limits.

    /**
     * @name getRateLimitErrorMessage
     * @param {Response} response - The response object from the fetch request. 
     * @returns {RateLimitData} - An object containing the rate limit error data.
     */
    static getRateLimitData(response) {
        const limit = response.headers.get("x-ratelimit-limit");
        const remaining = response.headers.get("x-ratelimit-remaining");
        const used = response.headers.get("x-ratelimit-used");
        const reset = response.headers.get("x-ratelimit-reset");
        const resource = response.headers.get("x-ratelimit-resource");
        const retry_after = response.headers.get("retry-after");
        var delay = 0;
        var time_final = null;
        const calculated_at = new Date();
        if (retry_after) {
            delay = parseInt(retry_after);
            time_final = new Date(calculated_at.getTime() + delay * 1000);
        }
        else if (reset) {
            const now = new Date();
            const reset_time = new Date(parseInt(reset) * 1000);
            time_final = reset_time;
            delay = reset_time - now;
        }
        else {
            // console.warn("No retry-after or reset header found");
            delay = -1;
            time_final = null;
        }

        var exhausted = (remaining == 0);

        return {
            limit: limit,
            delay: delay,
            resource: (resource) ? resource : "unknown",
            remaining: (remaining) ? remaining : -1,
            used: (used) ? used : -1,
            exhausted: exhausted,
            calculated_at: calculated_at,
            calculated_reset: time_final,
        }
    }

    /**
     * @name getRateLimitDataFromRateLimitResponseData
     * @param {Object} data - The response object from the fetch request.
     * @returns {RateLimitData} - An object containing the rate limit error data.
     * @description
     * Extracts the rate limit data from the response JSON.
     * @throws {Error} If the response does not contain the expected rate limit data.
     */
    static getRateLimitDataFromRateLimitResponseData(data) {
        // "rate": {
        //     "limit": 5000,
        //     "used": 1,
        //     "remaining": 4999,
        //     "reset": 1372700873
        // }
        const limit = data.rate.limit;
        const remaining = data.rate.remaining;
        const used = data.rate.used;
        const reset = data.rate.reset;
        const resource = "rate";
        const retry_after = null;
        var delay = 0;
        var time_final = null;
        const calculated_at = new Date();
        if (retry_after) {
            delay = parseInt(retry_after);
            time_final = new Date(calculated_at.getTime() + delay * 1000);
        }
        else if (reset) {
            const now = new Date();
            const reset_time = new Date(parseInt(reset) * 1000);
            time_final = reset_time;
            delay = reset_time - now;
        }
        else {
            // console.warn("No retry-after or reset header found");
            delay = -1;
            time_final = null;
        }
        var exhausted = (remaining == 0);
        return {
            limit: limit,
            delay: delay,
            resource: (resource) ? resource : "unknown",
            remaining: (remaining) ? remaining : -1,
            used: (used) ? used : -1,
            exhausted: exhausted,
            calculated_at: calculated_at,
            calculated_reset: time_final,
        }
    }

    /**
     * @name getRateLimitErrorMessage
     * @param {RateLimitData} data - The rate limit data object.
     * @returns {string} - The rate limit error message.
     */
    static getRateLimitErrorMessage(data) {
        var message = "Rate limit ";
        if (data.resource != "unknown") {
            message += `for ${data.resource} `;
        }
        var data_delay_message = "";
        if (data.delay > 0) {
            data_delay_message = `The rate limit will reset in ${data.delay} seconds. `;
        }
        else if (data.delay == -1) {
            data_delay_message = "The response was missing all delay-related headers. ";
        }
        else {
            data_delay_message = "Unhandled delay case: " + data.delay;
            console.warn(data_delay_message);
        }
        if (data.exhausted) {
            message += "exhausted. ";
            message += `The limit is ${data.limit} per use period. `;
        }
        else {
            message += "not exhausted. ";
            message += `You have used ${data.used} of ${data.limit} requests, and`;
            message += ` you have ${data.remaining} requests remaining. `;
        }
        message += data_delay_message;
        message += `The rate limit data was processed at ${data.calculated_at}. `;
        return message;
    }

    /**
     * @constructor
     * @param {Response|RateLimitData} response - The response object from the fetch request.
     * @param {string} [message] - Additional message to include in the error.
     */
    constructor(response, message = "") {
        const limit_data = (response instanceof Response) ? RateLimitError.getRateLimitData(response) : response;
        const limit_message = RateLimitError.getRateLimitErrorMessage(limit_data);
        const msg = limit_message + (message ? ` ${message}` : "");
        super(msg);
        this.name = "RateLimitError";
        this.limit_data = limit_data;
        this.message = limit_message;
        this.response = (response instanceof Response) ? response : null;
    }

    /**
     * @name isRateLimitError
     * @param {Response} response - The response object from the fetch request.
     * @returns {boolean} - True if the response is a rate limit error, false otherwise.
     */
    static isRateLimitError(response) {
        const object = RateLimitError.getRateLimitData(response);
        if (object.exhausted) {
            return true;
        }
        if (object.remaining == 0) {
            return true;
        }
        return false;
    }

    /**
     * @name isError
     * @description
     * Checks the limit data to see if it fits the conditions to throw.
     * @returns {boolean} - True if the data fulfills the conditions from the `isRateLimitError` function.
     */
    isError() {
        if (this.limit_data.exhausted) {
            return true;
        }
        if (this.limit_data.remaining == 0) {
            return true;
        }
        return false;
    }

    /**
     * @name responseHasRateLimitData
     * @description
     * Checks if a response has the relevant headers to create a RateLimitData object.
     * @param {Response} response - The response object from the fetch request.
     * @returns {boolean} - True if the response has rate limit data, false otherwise.
     */
    static responseHasRateLimitData(response) {
        // Not all are required. Try to match the cases used in the getRateLimitData function.
        const limit = response.headers.get("x-ratelimit-limit");
        const remaining = response.headers.get("x-ratelimit-remaining");
        const used = response.headers.get("x-ratelimit-used");
        const reset = response.headers.get("x-ratelimit-reset");
        const resource = response.headers.get("x-ratelimit-resource");
        const retry_after = response.headers.get("retry-after");
        // To know the time until reset, we need either the reset or the retry_after header.
        if (!reset && !retry_after) {
            return false;
        }
        // If it is a limit-related response, it must have the limit header.
        if (!limit) {
            return false;
        }
        // From here, any non-excluded response is considered a rate limit response.
        return true;
    }

    /**
     * @name asJSXElement
     * @description
     * Converts the error message to a JSX element.
     * @param {Object} [props] - The props to pass to the JSX element.
     * @returns {JSX.Element} - The JSX element containing the error message.
     */
    asJSXElement(props = null) {
        console.warn(`Building JSX element for RateLimitError: ${this.message}`);
        var elem = (
            <div>
                <h2>Rate Limit:</h2>
                <p>{this.message}</p>
            </div>
        );
        if (props) {
            elem = React.cloneElement(elem, props);
        }
        return elem;
    }

    /**
     * @name timeLeft
     * @description
     * Returns the time left until the rate limit resets.
     * @returns {number} - The time left in rational seconds.
     */
    timeLeft() {
        if (this.limit_data.calculated_reset) {
            const now = new Date();
            const time_left = this.limit_data.calculated_reset - now;
            return Math.max(0, time_left / 1000);
        }
        else {
            console.warn("No calculated reset time found");
            return -1;
        }
    }

}