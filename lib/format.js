export function formatPrice(n) {
  return `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
}

// "22362823995" -> "+223 62 82 39 95"
export function formatPhone(n) {
  return `+${n.slice(0, 3)} ${n.slice(3).replace(/(\d{2})(?=\d)/g, "$1 ")}`;
}
