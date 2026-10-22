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

export const useServicesData = (autoFetch = true) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = unwrap(await apiService.getServices());
            if (result.success) {
                setServices(result.data || []);
                return { success: true, services: result.data || [] };
            }
            setError(result.error);
            return { success: false, error: result.error };
        } finally {
            setLoading(false);
        }
    }, []);

    const createService = useCallback(async (service) => {
        setError(null);
        const result = unwrap(await apiService.createService(service));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    const updateService = useCallback(async (id, service) => {
        setError(null);
        const result = unwrap(await apiService.updateService(id, service));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    const deleteService = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteService(id));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    useEffect(() => {
        if (autoFetch) fetchServices();
    }, [autoFetch, fetchServices]);

    return { services, loading, error, fetchServices, createService, updateService, deleteService, setServices };
};

export const useCategoriesData = (autoFetch = true) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = unwrap(await apiService.getCategories());
            if (result.success) {
                setCategories(result.data || []);
                return { success: true, categories: result.data || [] };
            }
            setError(result.error);
            return { success: false, error: result.error };
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (category) => {
        setError(null);
        const result = unwrap(await apiService.createCategory(category));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    const updateCategory = useCallback(async (id, category) => {
        setError(null);
        const result = unwrap(await apiService.updateCategory(id, category));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    const deleteCategory = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteCategory(id));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    useEffect(() => {
        if (autoFetch) fetchCategories();
    }, [autoFetch, fetchCategories]);

    return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory, setCategories };
};

export const useProjectsData = (autoFetch = true) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = unwrap(await apiService.getProjects());
            if (result.success) {
                setProjects(result.data || []);
                return { success: true, projects: result.data || [] };
            }
            setError(result.error);
            return { success: false, error: result.error };
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (project) => {
        setError(null);
        const result = unwrap(await apiService.createProject(project));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    const updateProject = useCallback(async (id, project) => {
        setError(null);
        const result = unwrap(await apiService.updateProject(id, project));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    const deleteProject = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteProject(id));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    useEffect(() => {
        if (autoFetch) fetchProjects();
    }, [autoFetch, fetchProjects]);

    return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject, setProjects };
};

export const useContactFormsData = (autoFetch = true) => {
    const [contactForms, setContactForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchContactForms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = unwrap(await apiService.getContactForms());
            if (result.success) {
                setContactForms(result.data || []);
                return { success: true, contactForms: result.data || [] };
            }
            setError(result.error);
            return { success: false, error: result.error };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (id, status) => {
        setError(null);
        const result = unwrap(await apiService.updateContactFormStatus(id, status));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    const deleteContactForm = useCallback(async (id) => {
        setError(null);
        const result = unwrap(await apiService.deleteContactForm(id));
        if (!result.success) setError(result.error);
        return result;
    }, []);

    useEffect(() => {
        if (autoFetch) fetchContactForms();
    }, [autoFetch, fetchContactForms]);

    return { contactForms, loading, error, fetchContactForms, updateStatus, deleteContactForm, setContactForms };
};