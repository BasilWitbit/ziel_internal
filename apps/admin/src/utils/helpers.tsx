export function typedEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export function capitalizeWords(input: string): string {
    return input
        .split(' ')
        .map(word => {
            if (word.length === 0) return word;
            return word[0].toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

export function toQueryParams(params: Record<string, string>): string {  
  const searchParams = new URLSearchParams();  

  for (const [key, value] of Object.entries(params)) {  
    if (value !== undefined && value !== null) {  
      searchParams.append(key, value);  
    }  
  }  

  const queryString = searchParams.toString();  
  return queryString ? `?${queryString}` : '';  
} 