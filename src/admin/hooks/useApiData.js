import { useCallback, useEffect, useState } from 'react';
import apiService from '../services/apiService';

const unwrap = (result) => {
    // Backend pattern: { success, message, data }
    // apiService pattern: { success, data, error }
    if (!result?.success) return result;
    const payload = result.data;
    if (payload && typeof payload === 'object' && 'success' in payload) {
        return payload.success
            ? { success: true, data: payload.data }
            : { success: false, error: payload.message || 'Request failed', data: payload };
    }
    return { success: true, data: payload };
};


/**
 * Shared list-loading state. The automatic first load sets state only after the
 * request resolves (no synchronous setState inside the effect); manual refetches
 * flip `loading` on immediately.
 */
const useListResource = (fetcher, resultKey, autoFetch) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);

    const apply = useCallback((raw) => {
        const result = unwrap(raw);
        setLoading(false);
        if (result.success) {
            setError(null);
            setItems(result.data || []);
            return { success: true, [resultKey]: result.data || [] };
        }
        setError(result.error);
        return { success: false, error: result.error };
    }, [resultKey]);

    const fail = useCallback((err) => {
        const message = err?.message || 'Network error';
        setLoading(false);
        setError(message);
        return { success: false, error: message };
    }, []);

    const refetch = useCallback(() => {
        setLoading(true);
        setError(null);
        return fetcher().then(apply, fail);
    }, [fetcher, apply, fail]);

    useEffect(() => {
        if (autoFetch) fetcher().then(apply, fail);
    }, [autoFetch, fetcher, apply, fail]);

    return { items, setItems, loading, error, setError, refetch };
};

const getServices = () => apiService.getServices();
const getCategories = () => apiService.getCategories();
const getProjects = () => apiService.getProjects();
const getContactForms = () => apiService.getContactForms();

export const useServicesData = (autoFetch = true) => {
    const {
        items: services,
        setItems: setServices,
        loading,
        error,
        setError,
        refetch: fetchServices,
    } = useListResource(getServices, 'services', autoFetch);

    const createService = useCallback(async (service) => {
        setError(null);
        const result = unwrap(await apiService.createService(service));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    const updateService = useCallback(async (id, service) => {
        setError(null);
        const result = unwrap(await apiService.updateService(id, service));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    const deleteService = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteService(id));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    return { services, loading, error, fetchServices, createService, updateService, deleteService, setServices };
};

export const useCategoriesData = (autoFetch = true) => {
    const {
        items: categories,
        setItems: setCategories,
        loading,
        error,
        setError,
        refetch: fetchCategories,
    } = useListResource(getCategories, 'categories', autoFetch);

    const createCategory = useCallback(async (category) => {
        setError(null);
        const result = unwrap(await apiService.createCategory(category));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    const updateCategory = useCallback(async (id, category) => {
        setError(null);
        const result = unwrap(await apiService.updateCategory(id, category));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    const deleteCategory = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteCategory(id));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory, setCategories };
};

export const useProjectsData = (autoFetch = true) => {
    const {
        items: projects,
        setItems: setProjects,
        loading,
        error,
        setError,
        refetch: fetchProjects,
    } = useListResource(getProjects, 'projects', autoFetch);

    const createProject = useCallback(async (project) => {
        setError(null);
        const result = unwrap(await apiService.createProject(project));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    const updateProject = useCallback(async (id, project) => {
        setError(null);
        const result = unwrap(await apiService.updateProject(id, project));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    const deleteProject = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteProject(id));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject, setProjects };
};

export const useContactFormsData = (autoFetch = true) => {
    const {
        items: contactForms,
        setItems: setContactForms,
        loading,
        error,
        setError,
        refetch: fetchContactForms,
    } = useListResource(getContactForms, 'contactForms', autoFetch);

    const updateStatus = useCallback(async (id, status) => {
        setError(null);
        const result = unwrap(await apiService.updateContactFormStatus(id, status));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    const deleteContactForm = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteContactForm(id));
        if (!result.success) setError(result.error);
        return result;
    }, [setError]);

    return { contactForms, loading, error, fetchContactForms, updateStatus, deleteContactForm, setContactForms };
};