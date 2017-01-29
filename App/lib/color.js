/**
 * Created by jonathan on 2017-01-29.
 */
"use strict";
function setColor(color, total) {
    /**
     * Calculates the color depending on the ratio of each color.
     * Input:
     *   color: Shall be a object with named properties as key and the value shall be an object in the following form:
     *     {'color': '#ffffff', 'nr': 5}
     *     Ex. {'default': {"color": #ffffff, "nr": 5}, 'passed': {"color": #555555, "nr": 65}}
     *   total: Sum of all 'nr' fields from the color input
     * Output:
     *   hex-color. Ex. #123abc
     */
    let c = "#";
    for(let i = 0; i<3; i++) {
        let col = 0.0;
        for (let j in color) {
            if (color.hasOwnProperty(j)) {
                col += parseInt(color[j]['color'].substring(1+2*i, 3+2*i), 16)*(color[j]['nr']/total);
            }
        }
        let v = Math.floor(col);
        let sub = v.toString(16).toUpperCase();
        c += ('0'+sub).slice(-2);
    }
    return c;
}
export { setColor };
