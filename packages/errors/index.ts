interface CodedErrorOptions extends ErrorOptions {
	code: string;
}

export class CodedError extends Error {
	#code: string;

	constructor(message: string, options: CodedErrorOptions) {
		super(message, options);
		this.#code = options.code;
	}

	get code() {
		return this.#code;
	}
}
