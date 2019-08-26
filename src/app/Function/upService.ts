export function getUploadingData(name: string) {
  switch (name) {
    case 'weepal':
      return {
        url: null,
        user: null,
        password: null
      };
    default:
      break;
  }
}
