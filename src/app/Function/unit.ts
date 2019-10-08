function constareChannel(name: string = 't'): string {
  return `${name}${new Date().getTime()}`;
}

export const unit = {
  constareChannel
}
