cmake_minimum_required(VERSION 3.13)

# Project wrapper that includes React Native's default application CMake and
# enforces linking the shared libc++ so that all native targets resolve C++
# runtime symbols at link time and runtime.
project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

# Ensure the shared C++ runtime is linked into the app/library produced here.
# This makes builds consistent when multiple native modules expect libc++_shared.
set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -lc++_shared")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -lc++_shared")

if (TARGET ${CMAKE_PROJECT_NAME})
    target_link_libraries(${CMAKE_PROJECT_NAME} c++_shared)
endif()

# After including the React Native application CMake, many targets are created
# (react_codegen_*, appmodules, etc.). Ensure each library target links to
# libc++_shared so the C++ runtime symbols (operator new/delete, __cxa_*,
# typeinfo, mutex, etc.) are resolved at link time.
get_property(_allTargets
    DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    PROPERTY BUILDSYSTEM_TARGETS)

foreach(_t IN LISTS _allTargets)
    if(TARGET ${_t})
        # Only link to shared C++ runtime for IMPORTED or SHARED library targets.
            get_target_property(_type ${_t} TYPE)
            if(NOT "${_type}" STREQUAL "EXECUTABLE")
                message(STATUS "Enforcing c++_shared linkage for target ${_t} (type=${_type})")
                if("${_type}" STREQUAL "INTERFACE_LIBRARY")
                    # INTERFACE libraries require the INTERFACE keyword to be used.
                    target_link_libraries(${_t} INTERFACE c++_shared)
                else()
                    # Use the plain signature to stay consistent with earlier usages in
                    # ReactNative-application.cmake which use the plain form.
                    target_link_libraries(${_t} c++_shared)
                endif()
            endif()
    endif()
endforeach()
