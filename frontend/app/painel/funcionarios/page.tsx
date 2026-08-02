"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { EmployeeForm } from "@/components/painel/EmployeeForm";
import { Button, DataTable, Modal, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  createEmployeeThunk,
  deleteEmployeeThunk,
  fetchEmployeesThunk,
  updateEmployeeThunk,
} from "@/lib/redux/slices/employeesSlice";
import type { Employee, EmployeePayload } from "@/types/employees";

const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  garcom: "Garçom",
  cozinha: "Cozinha",
};

export default function FuncionariosPage() {
  const dispatch = useAppDispatch();
  const { items, roles, status } = useAppSelector((state) => state.employees);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  function openCreate() {
    setEditingEmployee(null);
    setModalMode("create");
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingEmployee(null);
  }

  async function handleSubmit(payload: EmployeePayload) {
    if (modalMode === "edit" && editingEmployee) {
      await dispatch(updateEmployeeThunk({ id: editingEmployee.id, payload })).unwrap();
    } else {
      await dispatch(createEmployeeThunk(payload)).unwrap();
    }
    closeModal();
  }

  async function handleDelete(employee: Employee) {
    if (!window.confirm(`Remover o funcionário "${employee.username}"?`)) return;
    await dispatch(deleteEmployeeThunk(employee.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h1" className="text-2xl">
            Funcionários
          </Text>
          <Text variant="muted">Cadastre a equipe e defina a função de cada um.</Text>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} />
          Novo funcionário
        </Button>
      </div>

      <DataTable
        data={items}
        isLoading={status === "loading"}
        emptyMessage="Nenhum funcionário cadastrado ainda."
        keyExtractor={(employee) => employee.id}
        columns={[
          { key: "username", header: "Usuário", render: (employee) => employee.username },
          { key: "email", header: "Email", render: (employee) => employee.email || "—" },
          {
            key: "roles",
            header: "Funções",
            render: (employee) =>
              employee.roles.map((code) => ROLE_LABELS[code] ?? code).join(", ") || "—",
          },
          {
            key: "is_active",
            header: "Status",
            render: (employee) => (employee.is_active ? "Ativo" : "Inativo"),
          },
          {
            key: "actions",
            header: "",
            render: (employee) => (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(employee)}
                  className="text-ink-muted transition-colors hover:text-accent"
                  aria-label="Editar"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(employee)}
                  className="text-ink-muted transition-colors hover:text-danger"
                  aria-label="Remover"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "edit" ? "Editar funcionário" : "Novo funcionário"}
      >
        <EmployeeForm
          initialValue={editingEmployee ?? undefined}
          roles={roles}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
