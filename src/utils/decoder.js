import iconv from 'iconv-lite';

export function decodeWithFallback(buffer) {
	let text = iconv.decode(buffer, 'utf-8');
	if (text.includes('�')) {
		text = iconv.decode(buffer, 'windows-1251');
	}
	return text;
}
