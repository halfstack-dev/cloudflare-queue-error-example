export default {
	async fetch(req, env, ctx): Promise<Response> {
		const total = 20_000;
		const batchSize = 100;

		for (let i = 0; i < total; i += batchSize) {
			const batch = Array.from({length: batchSize}, (_, j) => ({
				body: {id: i + j},
			}));
			await env.MY_QUEUE.sendBatch(batch);
		}

		return new Response(`Sent ${total} messages to the queue`);
	},
	async queue(batch, env): Promise<void> {
		for (let message of batch.messages) {
			console.log(`message ${message.id} processed: ${JSON.stringify(message.body)}`);
		}
	},
} satisfies ExportedHandler<Env, { id: number }>;
