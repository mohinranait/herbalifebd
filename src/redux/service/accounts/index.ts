import { baseApi } from "..";
import { IExpense, IExpenseListResponse, IProfitReportResponse } from "./type";

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfitReport: builder.query<IProfitReportResponse, string>({
      query: (params) => `/admin/reports/profit?${params}`,
      // Sales, costs and expenses all feed the report
      providesTags: ["reports", "orders", "order", "products", "expenses"],
    }),

    getExpenses: builder.query<IExpenseListResponse, string>({
      query: (params) => `/admin/expenses?${params}`,
      providesTags: ["expenses"],
    }),

    createExpense: builder.mutation<{ data: IExpense }, Partial<IExpense>>({
      query: (payload) => ({
        url: "/admin/expenses",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["expenses"],
    }),

    updateExpense: builder.mutation<{ data: IExpense }, { id: string; payload: Partial<IExpense> }>({
      query: ({ id, payload }) => ({
        url: `/admin/expenses/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["expenses"],
    }),

    deleteExpense: builder.mutation<{ data: IExpense }, string>({
      query: (id) => ({
        url: `/admin/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["expenses"],
    }),
  }),
});

export const {
  useGetProfitReportQuery,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = accountsApi;
