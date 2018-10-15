export function sanitizeForSlack(text: string): string {
    return text
    .split("") // this encodes with % codes only non-ascii characters
        .map(function (char) {
            const charCode = char.charCodeAt(0);
            return charCode > 127 ? encodeURIComponent(char) : char;
        })
        .join("")
    .split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt");
}
