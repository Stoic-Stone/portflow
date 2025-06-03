import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../lib/api';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

// ... existing code ...

                  <td className="py-2 px-4">{user.role ? (ROLE_FR[user.role as keyof typeof ROLE_FR] || user.role) : '-'}</td>
                  <td className="py-2 px-4">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="inline-flex justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                        <EllipsisVerticalIcon className="w-5 h-5" aria-hidden="true" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => setDetailsModal({ open: true, user })}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Détails
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => openEditModal(user)}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Modifier
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => openDeleteConfirm(user)}
                                  className={`${
                                    active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                  } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Supprimer
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
// ... existing code ... 