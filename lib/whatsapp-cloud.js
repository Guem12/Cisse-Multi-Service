/**
 * Envoi AUTOMATIQUE de WhatsApp via l'API Cloud officielle de Meta
 * (WhatsApp Business Platform — sans Twilio ni autre intermédiaire).
 *
 * Variables d'environnement (.env.local) :
 *   WHATSAPP_TOKEN          : jeton d'accès permanent (Meta app > WhatsApp > API Setup)
 *   WHATSAPP_PHONE_NUMBER_ID: identifiant du numéro WhatsApp Business (chiffres)
 *   WHATSAPP_TEMPLATE_NAME  : modèle approuvé par Meta, obligatoire pour écrire
 *                             à quelqu'un qui ne vous a pas contacté depuis 24 h
 *   WHATSAPP_TEMPLATE_LANG  : code langue du modèle (défaut : fr)
 *   WHATSAPP_API_VERSION    : version Graph API (défaut : v23.0, celle de la doc officielle)
 *
 * Modèle à créer dans le Meta Business Manager (une seule fois), texte proposé :
 *   ⚠ {{1}} : {{2}}
 * avec les variables envoyées par cette application :
 *   {{1}} = « RUPTURE » ou « Stock faible »
 *   {{2}} = détail du produit et de la quantité restante
 *
 * Sans modèle, l'application envoie un message libre (possible uniquement si
 * l'administrateur a écrit au numéro depuis moins de 24 h — sinon Meta renvoie
 * l'erreur 131026 et le journal l'indique clairement).
 */

export function isWhatsAppConfigured() {
  // WhatsApp Business Meta désactivé sur demande.
  return false;
}

export async function sendWhatsAppAlert() {
  return { ok: false, reason: "whatsapp_desactive" };
}
