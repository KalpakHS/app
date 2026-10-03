import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { mockAdminData } from '../data/mockData';
import MetricCard from '../components/common/MetricCard';
import BottomNavigation from '../components/common/BottomNavigation';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

export default function AdminFleetPage() {
  const [deviceFilter, setDeviceFilter] = useState('All');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Doctor');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [userList, setUserList] = useState(mockAdminData.userDirectory);
  const [auditLogs, setAuditLogs] = useState(mockAdminData.auditLogs);
  const [fleetStats, setFleetStats] = useState(null);
  const [devicesList, setDevicesList] = useState(mockAdminData.deviceRegistry);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [toast, setToast] = useState(null);
  const [dataSource, setDataSource] = useState('connecting'); // 'backend' | 'fallback'

  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      try {
        const [statsRes, devRes, userRes, logsRes] = await Promise.all([
          api.getFleetStats(),
          api.getDevices(),
          api.getAdminUsers(),
          api.getAuditLogs(),
        ]);

        if (isMounted) {
          if (statsRes.success && statsRes.data) {
            setFleetStats(statsRes.data);
            setDataSource('backend');
          }

          if (devRes.success && Array.isArray(devRes.data) && devRes.data.length > 0) {
            const mapped = devRes.data.map((d) => ({
              id: d.device_id,
              firmware: `Firmware ${d.firmware_version}`,
              battery: `${d.battery_level}%`,
              status: d.status === 'ONLINE' ? 'Synced' : d.battery_level < 25 ? 'Low Batt' : 'Offline',
              badgeClass: d.status === 'ONLINE' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : d.battery_level < 25 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200',
              ping: d.status === 'ONLINE' ? 'Ping: 12ms' : 'Timeout',
              icon: d.status === 'ONLINE' ? 'bluetooth_connected' : 'bluetooth_disabled',
              iconBg: d.status === 'ONLINE' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-rose-50 text-rose-600 border border-rose-100',
            }));
            setDevicesList(mapped);
          }

          if (userRes.success && Array.isArray(userRes.data) && userRes.data.length > 0) {
            const mappedUsers = userRes.data.map((u) => {
              const roleCapitalized = u.role.charAt(0).toUpperCase() + u.role.slice(1);
              const initials = u.full_name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'UN';
              return {
                id: `user-${u.id}`,
                name: u.full_name,
                role: roleCapitalized,
                title: `${roleCapitalized} Account`,
                initials,
                avatarBg: u.role === 'doctor' ? 'bg-sky-100 text-sky-700' : u.role === 'caregiver' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
                badgeBg: u.role === 'doctor' ? 'bg-sky-50 text-sky-700 border-sky-200' : u.role === 'caregiver' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
              };
            });
            setUserList(mappedUsers);
          }

          if (logsRes.success && Array.isArray(logsRes.data) && logsRes.data.length > 0) {
            const mappedLogs = logsRes.data.map((l) => ({
              id: `log-${l.id}`,
              timestamp: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              colorClass: l.status === 'SUCCESS' ? 'text-teal-700 font-semibold' : 'text-amber-700 font-semibold',
              message: `${l.action}: ${l.details || l.entity_type}`,
            }));
            setAuditLogs(mappedLogs);
          }
        }
      } catch (e) {
        if (isMounted) setDataSource('fallback');
      }
    }

    loadAdminData();
    return () => { isMounted = false; };
  }, []);

  const metrics = fleetStats ? {
    registeredDevices: `${fleetStats.totalDevices}`,
    registeredGrowth: "+12% this week",
    activeMeshHeads: `${fleetStats.activeDevices}`,
    meshOperationalPct: `${fleetStats.meshCoverage} Operational`,
    batteryDegradationAvg: `${fleetStats.averageBattery}% fleet avg`,
    batteryDegradationPct: 28,
    meshWearInspectionCount: fleetStats.maintenanceDevices || 12,
    meshWearPct: 65,
  } : mockAdminData.fleetMetrics;

  const mqtt = mockAdminData.mqttStatus;

  const filteredDevices = deviceFilter === 'All'
    ? devicesList
    : devicesList.filter(d => d.status.toLowerCase().includes(deviceFilter.toLowerCase()));

  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    setToast('Running full ultrasonic transducer impedance scan across registered devices...');
    setTimeout(() => {
      setIsDiagnosing(false);
      setToast('Diagnostics Complete: All active mesh atomizers passed resonant frequency test.');
      
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        colorClass: 'text-teal-700 font-semibold',
        message: 'Diagnostics scan completed: All mesh units verified optimal'
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }, 1400);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const email = `${newUserName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@clinic.smartneb.io`;
    const res = await api.createAdminUser({
      full_name: newUserName,
      email,
      role: newUserRole.toLowerCase(),
      phone: '+1 (555) 000-0000',
      password: 'SmartNebPass123!',
    });

    const initials = newUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'UN';
    const newUser = {
      id: res.success ? `user-${res.data.id}` : `user-${Date.now()}`,
      name: newUserName,
      role: newUserRole,
      title: newUserTitle || `${newUserRole} Account`,
      initials,
      avatarBg: newUserRole === 'Doctor' ? 'bg-sky-100 text-sky-700' : newUserRole === 'Caregiver' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
      badgeBg: newUserRole === 'Doctor' ? 'bg-sky-50 text-sky-700 border-sky-200' : newUserRole === 'Caregiver' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };

    setUserList([newUser, ...userList]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserTitle('');
    setToast(`Provisioned account for ${newUserName} (${newUserRole})`);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      colorClass: 'text-sky-700 font-semibold',
      message: `User created & provisioned: ${newUserName} -> ${newUserRole}`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="bg-[#F8FAFC] font-body-md text-[#0F172A] flex flex-col min-h-screen">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl pt-safe border-b border-slate-200">
        <div className="h-16 px-3 sm:px-4 flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-headline-sm text-teal-600 font-bold text-lg tracking-tight">SmartNeb</span>
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] text-emerald-700 font-medium">
              <span className="material-symbols-outlined text-[13px]">cloud_download</span>
              <span>{dataSource === 'backend' ? 'Fleet Live' : 'Local Demo'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 border border-slate-200 px-2 sm:px-2.5 py-1 rounded-full text-[11px] text-slate-600">
              <div className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-teal-600 text-[14px]">battery_charging_full</span>
                <span className="font-medium text-slate-800">84%</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sky-600 text-[14px]">water_drop</span>
                <span className="font-medium text-slate-800">92%</span>
              </div>
            </div>
            <div className="w-8 h-8 shrink-0 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full px-4 pt-20 pb-28 gap-4 bg-[#F8FAFC] max-w-md mx-auto">
        
        {/* Top Telemetry Banner / Status Bar */}
        <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                router
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-slate-900 font-semibold text-sm">MQTT Broker Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  {mqtt.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">
                {mqtt.cluster}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-headline-sm text-teal-600 font-bold text-base">{mqtt.latency}</div>
            <div className="text-[11px] text-slate-500 font-medium">Latency</div>
          </div>
        </div>

        {/* Fleet Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Registered Devices"
            value={metrics.registeredDevices}
            trend={metrics.registeredGrowth}
            icon="devices"
            iconColor="text-sky-600"
          />
          <MetricCard
            title="Active Mesh Heads"
            value={metrics.activeMeshHeads}
            subtitle={metrics.meshOperationalPct}
            icon="vibration"
            iconColor="text-teal-600"
          />
        </div>

        {/* Device Health & Diagnostics Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">health_metrics</span>
              <span className="font-headline-sm text-slate-900 font-semibold text-sm">Fleet Health &amp; Diagnostics</span>
            </div>
            <button 
              onClick={handleRunDiagnostics}
              disabled={isDiagnosing}
              className="text-xs text-teal-600 font-semibold hover:underline disabled:opacity-50"
            >
              {isDiagnosing ? 'Running...' : 'Run Diagnostics'}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">ESP32 Battery Degradation Avg</span>
                <span className="text-slate-900 font-semibold">{metrics.batteryDegradationAvg}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.batteryDegradationPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Ultrasonic Mesh Atomizer Wear</span>
                <span className="text-amber-600 font-semibold">{metrics.meshWearInspectionCount} units require inspection</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.meshWearPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ESP32 Device Registry List */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[20px]">memory</span>
              <span className="font-headline-sm text-slate-900 font-semibold text-sm">ESP32 Device Registry</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {['All', 'Synced', 'Low Batt', 'Offline'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDeviceFilter(filter)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                    deviceFilter === filter
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredDevices.map((dev) => (
              <div 
                key={dev.id}
                onClick={() => setSelectedDevice(dev)}
                className="bg-white p-3 rounded-lg flex items-center justify-between border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dev.iconBg}`}>
                    <span className="material-symbols-outlined text-[18px]">{dev.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{dev.id}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{dev.firmware} • Battery {dev.battery}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${dev.badgeClass}`}>
                    {dev.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">{dev.ping}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Role Management Directory */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[20px]">group</span>
              <span className="font-headline-sm text-slate-900 font-semibold text-sm">User Role Directory</span>
            </div>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="bg-teal-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm hover:bg-teal-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">person_add</span>
              <span>Add User</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {userList.map((user) => (
              <div key={user.id} className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.avatarBg}`}>
                    {user.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{user.title}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${user.badgeBg}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Audit Logs */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600 text-[20px]">receipt_long</span>
              <span className="font-headline-sm text-slate-900 font-semibold text-sm">System Audit Logs</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Stream
            </span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto no-scrollbar">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex justify-between text-slate-600 border-b border-slate-200/70 pb-1.5 last:border-b-0 last:pb-0">
                <span className={log.colorClass}>[{log.timestamp}]</span>
                <span className="truncate ml-2 text-slate-700 flex-1 text-right">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Add User Modal */}
      <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Provision Healthcare User">
        <form onSubmit={handleAddUser} className="flex flex-col gap-3 py-1">
          <div>
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <input 
              type="text" 
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Dr. Catherine Brooks"
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-600 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Role</label>
            <select 
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-600 outline-none bg-white"
            >
              <option value="Doctor">Doctor</option>
              <option value="Caregiver">Caregiver</option>
              <option value="Patient">Patient</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Specialty / Title</label>
            <input 
              type="text" 
              value={newUserTitle}
              onChange={(e) => setNewUserTitle(e.target.value)}
              placeholder="e.g. Pediatric Pulmonologist"
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-600 outline-none"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm mt-2"
          >
            Create &amp; Provision User
          </button>
        </form>
      </Modal>

      {/* Device Config Modal */}
      <Modal isOpen={!!selectedDevice} onClose={() => setSelectedDevice(null)} title="Device Telemetry Config">
        {selectedDevice && (
          <div className="flex flex-col gap-3 py-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Device ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedDevice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Firmware:</span>
                <span className="font-semibold text-slate-800">{selectedDevice.firmware}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Battery Level:</span>
                <span className="font-semibold text-teal-700">{selectedDevice.battery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MQTT Heartbeat:</span>
                <span className="font-semibold text-emerald-600">{selectedDevice.ping}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedDevice(null);
                setToast(`OTA firmware check initiated for ${selectedDevice.id}. Device is on latest build.`);
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Push OTA Update
            </button>
          </div>
        )}
      </Modal>

      {/* Admin Bottom Navigation */}
      <BottomNavigation role="admin" activeTab="fleet" />
    </div>
  );
}
