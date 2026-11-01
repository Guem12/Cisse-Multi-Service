// Configuration Neon AI Gateway
// Une seule API credential pour tous les fournisseurs de LLM
// Docs : https://neon.tech/docs/ai-gateway

const AI_GATEWAY_BASE_URL = process.env.AI_GATEWAY_BASE_URL;
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;
const AI_DEFAULT_PROVIDER = process.env.AI_DEFAULT_PROVIDER || 'openai';

const MODEL_PROVIDERS = {
  openai: { baseSuffix: '/openai', sdk: 'openai' },
  anthropic: { baseSuffix: '/anthropic', sdk: 'anthropic' },
  google: { baseSuffix: '/google', sdk: 'google-genai' },
  meta: { baseSuffix: '/meta', sdk: 'meta' }
};

const hasAIGateway = !!AI_GATEWAY_BASE_URL && !!AI_GATEWAY_API_KEY;

function getClient() {
  const provider = MODEL_PROVIDERS[AI_DEFAULT_PROVIDER] || MODEL_PROVIDERS.openai;
  const baseUrl = `${AI_GATEWAY_BASE_URL}${provider.baseSuffix}`;
  const { OpenAI } = require('openai');
  return new OpenAI({ apiKey: AI_GATEWAY_API_KEY, baseURL: baseUrl });
}

exports.AI_GATEWAY_BASE_URL = AI_GATEWAY_BASE_URL;
exports.AI_GATEWAY_API_KEY = AI_GATEWAY_API_KEY;
exports.AI_DEFAULT_PROVIDER = AI_DEFAULT_PROVIDER;
exports.hasAIGateway = hasAIGateway;
exports.MODEL_PROVIDERS = MODEL_PROVIDERS;
exports.getClient = getClient;