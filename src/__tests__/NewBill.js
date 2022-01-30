/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import fakeStore from "../__mocks__/fakeStore.js";
import { ROUTES_PATH } from "../constants/routes";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		let expenseType, expenseName, date, amount, vat, pct, commentary, file, submit;
		beforeEach(() => {
			const html = NewBillUI();
			document.body.innerHTML = html;
			expenseType = screen.getByRole("combobox");
			expenseName = screen.getByTestId("expense-name");
			date = screen.getByTestId("datepicker");
			amount = screen.getByTestId("amount");
			vat = screen.getByTestId("vat");
			pct = screen.getByTestId("pct");
			commentary = screen.getByTestId("commentary");
			file = screen.getByTestId("file");
			submit = screen.getByRole("button", { name: /envoyer/i });
		});
		test("Then form should be displayed", () => {
			expect(expenseType).toBeTruthy();
			expect(expenseName).toBeTruthy();
			expect(date).toBeTruthy();
			expect(amount).toBeTruthy();
			expect(vat).toBeTruthy();
			expect(pct).toBeTruthy();
			expect(commentary).toBeTruthy();
			expect(file).toBeTruthy();
			expect(submit).toBeTruthy();
		});
		test("Then file selection should only accept jpeg, jpg, png", () => {
			const onNavigate = () => {};
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			const user = JSON.stringify({
				type: "Employee",
			});
			window.localStorage.setItem("user", user);
			const newBill = new NewBill({ document, onNavigate, store: fakeStore, localStorage: window.localStorage });

			jest.spyOn(fakeStore, "bills");

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

			expect(fakeStore.bills).toHaveBeenCalledTimes(3);
		});
		describe("When form is filed", () => {
			test("Then form should submit", () => {
				const onNavigate = jest.fn();
				Object.defineProperty(window, "localStorage", { value: localStorageMock });
				const user = JSON.stringify({
					type: "Employee",
				});
				window.localStorage.setItem("user", user);
				const newBill = new NewBill({ document, onNavigate, store: fakeStore, localStorage: window.localStorage });

				// Cant simulate file upload
				file.remove();

				expenseType.value = "Transports";
				expenseName.value = "Expense Name";
				date.value = "2020-01-01";
				amount.value = "100";
				vat.value = "70";
				pct.value = "20";
				commentary.value = "Commentary";

				const bill = {
					email: undefined,
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
				submit.click();
				expect(newBill.updateBill).toHaveBeenCalledWith(bill);
				expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
			});
		});
	});
});
