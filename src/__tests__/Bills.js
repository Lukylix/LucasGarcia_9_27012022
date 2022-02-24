/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
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
		});
		test("Then bill icon in vertical layout should be highlighted", async () => {
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			expect(windowIcon.className).toContain("active-icon");
		});
		test("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen
				.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
		test("Then eye icons should be displayed", () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const eyeIcons = screen.getAllByTestId("icon-eye");
			expect(eyeIcons.length).toBe(bills.length);
		});
		describe("When user click on create new bill", () => {
			test("Then user should be redirect to the new bill page", async () => {
				window.onNavigate(ROUTES_PATH.Bills);
				const spyOnNavigate = jest.spyOn(window, "onNavigate");
				await waitFor(() => screen.getByTestId("btn-new-bill"));
				const createNewBillButton = screen.getByTestId("btn-new-bill");
				createNewBillButton.click();
				expect(spyOnNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
			});
		});
		describe("When click on eye icon", () => {
			test("Then bill modal should be displayed with it's image", async () => {
				window.onNavigate(ROUTES_PATH.Bills);
				await waitFor(() => screen.getAllByTestId("icon-eye"));
				const eyeIcons = screen.getAllByTestId("icon-eye");
				eyeIcons[0].click();
				const imgUrl = eyeIcons[0].getAttribute("data-bill-url");
				const modal = screen.getByTestId("modaleFile");
				const modalImg = modal.querySelector(".modal-body img");
				expect(modal.innerHTML).toContain("Justificatif");
				expect(modalImg.src).toContain(encodeURI(imgUrl));
			});
		});
	});
});
