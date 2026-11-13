
import { TCategoryFormData } from "@/components/validations/categories";
import { baseApi } from "..";
import { ICategory, ICategoryListResponse } from "./type";
import { ISoftDelete } from "@/types/common.type";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ICategoryListResponse, string>({
      query: (params) => `/admin/categories?${params}`,
      providesTags: ['category'],
    }),

    createCategory: builder.mutation<ICategory, TCategoryFormData | any>({
      query: (payload) => ({
        url: '/admin/categories',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['category'],
    }),

    updateCategory: builder.mutation<ICategory, { id: string; payload: Partial<TCategoryFormData> | any }>({
      query: ({ id, payload }) => ({
        url: `/admin/categories/${id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['category'],
    }),

    softDeleteCategory: builder.mutation<ICategory, {id:string,payload:ISoftDelete}>({
      query: ({ id, payload }) => ({
        url: `/admin/categories/${id}/soft`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['category'],
    }),

    deleteCategory: builder.mutation<ICategory, string>({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['category'],
    }),
  })
})


export const {useGetCategoriesQuery, useLazyGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useSoftDeleteCategoryMutation, useDeleteCategoryMutation  } = categoryApi;