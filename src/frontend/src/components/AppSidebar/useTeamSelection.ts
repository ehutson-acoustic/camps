import {useEffect, useMemo, useRef, useState} from 'react';
import {Location} from 'react-router-dom';
import {EmployeesData} from './types';
import {Team} from "@/types/schema.ts";

export const useTeamSelection = (
    teams: Team[],
    employeesData: EmployeesData | undefined,
    location: Location
) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const isManualSelection = useRef(false);
    const prevEmployeeIdRef = useRef<string | null>(null);

    // Extract the employee ID from URL if present
    const employeeIdFromUrl = useMemo(() => {
        const match = /\/employee\/([^/]+)/.exec(location.pathname);
        return match ? match[1] : null;
    }, [location.pathname]);

    // Find an employee by ID
    const employeeFromUrl = useMemo(() => {
        if (!employeeIdFromUrl || !employeesData?.employees) return null;
        return employeesData.employees.find(emp => emp.id === employeeIdFromUrl) || null;
    }, [employeeIdFromUrl, employeesData?.employees]);

    // Get the currently selected team
    const selectedTeam = useMemo(() => {
        if (!teams || !selectedTeamId) return null;
        return teams.find(team => team.id === selectedTeamId) || null;
    }, [teams, selectedTeamId]);

    // Filter employees by selected team
    const teamEmployees = useMemo(() => {
        if (!employeesData?.employees || !selectedTeamId) return [];

        return employeesData.employees
            .filter(employee => employee.team?.id === selectedTeamId)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [employeesData?.employees, selectedTeamId]);

    // Load the selected team based on the URL, localStorage, or default to the first team
    useEffect(() => {
        // Only auto-select the team if the employee ID changed or initial load
        const employeeIdChanged = prevEmployeeIdRef.current !== employeeIdFromUrl;
        prevEmployeeIdRef.current = employeeIdFromUrl;

        // If this is a manual selection, don't override with the URL-based team
        if (isManualSelection.current) {
            isManualSelection.current = false;
            return;
        }

        if (employeeFromUrl?.team?.id && employeeIdChanged) {
            // Auto-select the team based on the URL employee
            setSelectedTeamId(employeeFromUrl.team.id);
            localStorage.setItem('selectedTeamId', employeeFromUrl.team.id);
        } else if (!selectedTeamId && teams.length > 0) {
            // On initial load, use saved team or default
            const savedTeamId = localStorage.getItem('selectedTeamId');
            if (savedTeamId && teams.some(team => team.id === savedTeamId)) {
                setSelectedTeamId(savedTeamId);
            } else if (teams.length > 0) {
                setSelectedTeamId(teams[0].id);
            }
        }
    }, [teams, employeeFromUrl, employeeIdFromUrl, selectedTeamId]);

    // Save the selected team to localStorage when it changes
    const handleTeamChange = (teamId: string) => {
        isManualSelection.current = true;
        setSelectedTeamId(teamId);
        localStorage.setItem('selectedTeamId', teamId);
    };

    return {
        selectedTeamId,
        selectedTeam,
        teamEmployees,
        handleTeamChange
    };
};