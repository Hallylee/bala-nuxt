export default function(channel) {
  const type = {
    head: '',
    foot: ''
  };

  switch (channel) {
    case 'ORDINARY':
    case 'EDIT':
    case 'SPECIAL':
    case 'INTEREST':
      type.head = 'b';
      break;
    case 'INFORMATION':
      type.head = 'k';
      break;
    case 'SHENMA_IMPORT_PIC':
      type.head = 'k';
      type.foot = '_tk';
      break;
    case 'BAIDU_GOOD':
    case 'SHENMA_IMPORT':
      type.head = 'k';
      type.foot = '_sjxdr';
      break;
    case 'GOOD_SHENMA':
      type.head = 'k';
      type.foot = '_sjx';
      break;
    case 'GOOD_HOBBY':
      type.head = 'k';
      type.foot = '_xqjx';
      break;
    case 'COMPOSITION_DEFAULT':
      type.head = 'z';
      break;
    default:
      type.head = 'b';
  }
  return type;
}
