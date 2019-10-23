#pragma once

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>
//#define GLEW_STATIC
//#include <gl/glew.h>
#include <glad/glad.h>

class Shader
{
public:
	GLuint Program;
	Shader();
	Shader(const std::string vertexPath, const std::string fragmentPath);
	void Use();
};

