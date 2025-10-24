//last message format
export function truncateWithoutCuttingWord(text: string | undefined, limit = 100): string {
    if (!text) return '';
    if (text.length <= limit) return text;
    const truncated = text.substring(0, limit);
    const safeCut = truncated.replace(/[\s.,;!?]*$/, '');
    return safeCut + '...';
}
