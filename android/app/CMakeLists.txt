cmake_minimum_required(VERSION 3.13)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(ANDROID_STL c++_shared)

add_library(cpp_shared SHARED IMPORTED)