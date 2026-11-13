import { baseApi } from "..";

export interface ITranslationsResponse {
  success: boolean;
  message?: string;
  data: Record<string, string>;
  updatedAt?: string;
}

export const translationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public Storefront
    getTranslations: builder.query<ITranslationsResponse, void>({
      query: () => "/translations",
      providesTags: ["translations"],
    }),

    // Admin Panel
    getAdminTranslations: builder.query<ITranslationsResponse, void>({
      query: () => "/admin/translations",
      providesTags: ["translations"],
    }),

    updateAdminTranslations: builder.mutation<ITranslationsResponse, { content: Record<string, string> }>({
      query: (payload) => ({
        url: "/admin/translations",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["translations"],
    }),

    resetAdminTranslations: builder.mutation<ITranslationsResponse, void>({
      query: () => ({
        url: "/admin/translations",
        method: "POST",
        body: { action: "reset" },
      }),
      invalidatesTags: ["translations"],
    }),
  }),
});

export const {
  useGetTranslationsQuery,
  useGetAdminTranslationsQuery,
  useUpdateAdminTranslationsMutation,
  useResetAdminTranslationsMutation,
} = translationsApi;
