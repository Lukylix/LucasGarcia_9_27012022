/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		let formElements;
		beforeEach(() => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = "";
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.NewBill);
			waitFor(() => screen.getByTestId("form-new-bill"));
			formElements = {
				expenseType: screen.getByRole("combobox"),
				expenseName: screen.getByTestId("expense-name"),
				date: screen.getByTestId("datepicker"),
				amount: screen.getByTestId("amount"),
				vat: screen.getByTestId("vat"),
				pct: screen.getByTestId("pct"),
				commentary: screen.getByTestId("commentary"),
				file: screen.getByTestId("file"),
				submit: screen.getByRole("button", { name: /envoyer/i }),
			};
		});
		test("Then form should be displayed", () => {
			for (const key in formElements) {
				expect(formElements[key]).toBeTruthy();
			}
		});
		test("Then file selection should only accept jpeg, jpg, png", () => {
			const newBill = new NewBill({
				document,
				onNavigate, // window.onNavigate
				store: mockStore,
				localStorage, // window.localStorage
			});

			jest.spyOn(mockStore, "bills");
			jest.spyOn(window, "alert");

			const event = { preventDefault: () => {}, target: { value: "test.pdf" } };
			newBill.handleChangeFile(event);
			expect(event.target.value).toBe("");

			event.target.value = "test.docx";
			newBill.handleChangeFile(event);
			expect(event.target.value).toBe("");

			event.target.value = "test.jpeg";
			newBill.handleChangeFile(event);
			expect(event.target.value).toBe("test.jpeg");

			event.target.value = "test.jpg";
			newBill.handleChangeFile(event);
			expect(event.target.value).toBe("test.jpg");

			event.target.value = "test.png";
			newBill.handleChangeFile(event);
			expect(event.target.value).toBe("test.png");

			expect(window.alert).toHaveBeenCalledTimes(2);
			expect(mockStore.bills).toHaveBeenCalledTimes(3);
		});
		describe("When form is filed", () => {
			test("Then form should submit", () => {
				const newBill = new NewBill({
					document,
					onNavigate, // window.onNavigate
					store: mockStore,
					localStorage, // window.localStorage
				});
				const { expenseType, expenseName, date, amount, vat, pct, commentary, file, submit } = formElements;

				//cant simulate file upload
				file.remove();

				expenseType.value = "Transports";
				expenseName.value = "Expense Name";
				date.value = "2020-01-01";
				amount.value = "100";
				vat.value = "70";
				pct.value = "20";
				commentary.value = "Commentary";

				const bill = {
					email: undefined, // not defined in localStorage
					type: expenseType.value,
					name: expenseName.value,
					amount: parseInt(amount.value),
					date: date.value,
					vat: vat.value,
					pct: parseInt(pct.value),
					commentary: commentary.value,
					fileUrl: null,
					fileName: null,
					status: "pending",
				};
				jest.spyOn(newBill, "updateBill");
				jest.spyOn(newBill, "onNavigate");
				submit.click();
				expect(newBill.updateBill).toHaveBeenCalledWith(bill);
				expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
			});
		});
	});
});
