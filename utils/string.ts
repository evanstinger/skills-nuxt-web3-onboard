export const shortenAddress = (address: string, start: number = 6, end: number = -4) => {
  if (!address) return ''
  return `${address.slice(0, start)}...${address.slice(end)}`
}