export const routes = {
	auth: {
		login: "/login",
	},

	app: {
		home: "/",
	},

	leagues: {
		leagues: "/ligas",
		new: "/ligas/ligas-criar",
		settings: "/ligas/configuracoes",
	},

	subscriptions: {
		subscriptions: "/assinaturas",
	},

	clubs: {
		clubs: "/clubes",
	},

	transactionTypes: {
		transactionTypes: "/tipos-transacao",
	},

	players: {
		image: "/jogadores/imagem",
	},

	transferMarket: {
		contract: "/mercado/contratar",
	},
} as const;
