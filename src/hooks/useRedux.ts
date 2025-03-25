"use client";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/slices/reducer";
import type { AppDispatch } from "@/redux/store";

// Sử dụng trong toàn bộ ứng dụng thay vì useDispatch và useSelector thông thường
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
