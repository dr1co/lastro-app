/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionForm, type FormState } from "@/components/ui/action-form";
import { Button, SubmitButton } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

describe("Field", () => {
  it("renders a labelled input", () => {
    render(<Field label="Nome" name="name" />);
    expect(screen.getByLabelText("Nome")).toHaveAttribute("name", "name");
  });

  it("renders a select with options", () => {
    render(
      <Field label="Cor" name="color" options={[{ value: "a", label: "Verde" }, { value: "b", label: "Azul" }]} defaultValue="b" />,
    );
    expect(screen.getByLabelText("Cor")).toHaveValue("b");
    expect(screen.getByRole("option", { name: "Verde" })).toBeInTheDocument();
  });

  it("shows a hint", () => {
    render(<Field label="E-mail" name="email" hint="Opcional" />);
    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription("Opcional");
  });
});

describe("Button", () => {
  it("renders the variant and forwards props", () => {
    render(<Button variant="danger" type="button">Excluir</Button>);
    expect(screen.getByRole("button", { name: "Excluir" })).toHaveAttribute("data-variant", "danger");
  });
});

describe("ActionForm", () => {
  it("shows field errors and keeps submitted values when the action fails", async () => {
    const action = jest.fn(async (_prev: FormState, formData: FormData): Promise<FormState> => ({
      errors: { name: "Campo obrigatório." },
      values: { name: String(formData.get("name")), email: "gio@example.com" },
    }));

    render(
      <ActionForm action={action}>
        <Field label="Nome" name="name" />
        <Field label="E-mail" name="email" />
        <SubmitButton>Salvar</SubmitButton>
      </ActionForm>,
    );

    await userEvent.type(screen.getByLabelText("Nome"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    const name = await screen.findByLabelText("Nome");
    expect(action).toHaveBeenCalledTimes(1);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Campo obrigatório.");
    expect(name).toHaveValue("x");
    expect(screen.getByLabelText("E-mail")).toHaveValue("gio@example.com");
  });

  it("shows the action message", async () => {
    const action = async (): Promise<FormState> => ({ message: "Convite criado.", status: "success" });
    render(
      <ActionForm action={action}>
        <SubmitButton>Enviar</SubmitButton>
      </ActionForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Convite criado.");
  });

  it("announces error messages as alerts", async () => {
    const action = async (): Promise<FormState> => ({ message: "E-mail ou senha incorretos.", status: "error" });
    render(
      <ActionForm action={action}>
        <SubmitButton>Entrar</SubmitButton>
      </ActionForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
  });
});
