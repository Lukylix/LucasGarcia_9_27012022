class ApiEntity {
	async select() {
		return {};
	}
	async list() {
		return {};
	}
	async update() {
		return {};
	}
	async create() {
		return {};
	}
	async delete() {
		return {};
	}
}

class Store {
	user = () => new ApiEntity().select();
	users = () => new ApiEntity();
	login = () => {};

	ref = () => {};

	bill = () => new ApiEntity().select();
	bills = () => new ApiEntity();
}

export default new Store();
